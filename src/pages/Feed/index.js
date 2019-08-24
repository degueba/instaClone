import React, { useState, useEffect, useCallback } from 'react';


import { View, FlatList, Text } from 'react-native';

import { Post, Header, Avatar, PostImage, Description, Name, Loading } from './styles';


// Components
import LazyImage from '../../components/LazyImage';

export default function Feed(){
    const [feed, setFeed] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [viewable, setViewable] = useState([]);

    async function loadPage(pageNumber = page, shouldRefresh = false){
        if(total && pageNumber > total) return;


        setLoading(true);

        const response = await fetch(
            `http://localhost:3000/feed?_expand=author&_limit5&_page=${pageNumber}`
        );

        const data = await response.json();
        const totalItems = response.headers.get('X-Total-Count');
        
        setTotal(Math.floor(totalItems / 5)); // se retornar numero quebrado arredonda pra cima
        setFeed(shouldRefresh ? data : [...feed, ...data]); // increment feed + data
        setPage(pageNumber + 1);
        setLoading(false);
    }

    useEffect(() => {
        loadPage();
    }, []); // Executa uma única vez dentro da minha aplicação

    async function refreshList(){
        setRefreshing(true);

        await loadPage(1, true);

        setRefreshing(false);
    }

    const handleViewableChanged = useCallback(({ changed }) => {
        setViewable(changed.map(({ item }) => item.id));
    }, []);

    return (
        <View>
            <FlatList
                data={feed}
                keyExtractor={post => String(post.id)}
                onRefresh={refreshList}
                refreshing={refreshing}
                onViewableItemsChanged={handleViewableChanged}
                onEndReached={() => loadPage()}
                onEndReachedThreshold={0.1}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 10 }}
                ListFooterComponent={loading && <Loading />}
                renderItem={({ item }) => (
                    <Post>
                        <Header>
                            <Avatar source={{uri: item.author.avatar}}></Avatar>
                            <Name>{item.author.name}</Name>
                        </Header>
                        <LazyImage 
                            shouldLoad={viewable.includes(item.id)}
                            aspectRatio={item.aspectRatio} 
                            source={{uri: item.image}}
                            smallSource={{uri: item.small}}
                        />
                        <Description>{item.description}</Description>
                    </Post>
                )}>
            </FlatList>
        </View>
    );
}